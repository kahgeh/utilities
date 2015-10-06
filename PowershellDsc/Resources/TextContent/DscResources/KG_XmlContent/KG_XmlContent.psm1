#not meant for large files, because there is not consideration for working with large files, ensure memory has approx. 2 times the size of the file

#region Content editor helper functions
	

	#region Utility
	function SplitArray
	{
		param([array]$originalArray,$splitIndex)

		$firstArray=@()
		$secondArray=@()

		0..$splitIndex|%{
			$index=$_
			$firstArray=$firstArray+$originalArray[$index]
		}

		 ($splitIndex+1)..($originalArray.Length-1)|%{
			$index=$_
			$secondArray=$secondArray+$originalArray[$index]
		}

		@($firstArray,$secondArray)
	}
	#endregion



	#region Xml Helpers
	function CreateNodesIfItDoesntExists
	{
		param($xmlDoc,$update)
    
		$xpath=$update.XPath
		$xpathParts=$xpath.Split("/") 
		$iValidXPathPartIndex=-1
		$iValidXPathPartIndex=$xpathParts.Length
		do{
        
			$firstAndLastParts=SplitArray $xpathParts ($iValidXPathPartIndex-2)
			$firstParts=$firstAndLastParts[0]
			$lastParts=$firstAndLastParts[1]

			$firstPartXPath=[string]::Join("/",$firstParts)

			$nodes=$xmlDoc.SelectNodes($firstPartXPath)
			if($nodes -ne $null -and $node.Count -gt 1 ) 
			{
				Write-Host ("Skipping update because xpath ({0}) is not valid" -f $xpath)
				$parentNode=$null
				break
			}
        
			if($nodes -ne $null -and $nodes.Count -eq  1)
			{
				$parentNode=$nodes[0]
			}
			$iValidXPathPartIndex--
		}while($iValidXPathPartIndex -gt 0 -and $parentNode -eq $null)

		if($parentNode -eq $null){return}

    
		$lastParts|%{
			$xPathPart=$_
			$newNode=CreateValidXml $xmlDoc $parentNode $xPathPart $update
			if ( $newNode -eq $null -and $newNode -ne [System.Xml.XmlElement] ) {break;}
			$parentNode=$newNode
		}

		if($newNode -is [System.Xml.XmlAttribute]){$newNode.Value=$update.Value}
		if($newNode -is [System.Xml.XmlElement]){$newNode.InnerText=$update.Value}
    

    
	}

	function CreateValidXml
	{
		param($xmlDoc,$parentNode, $lastPart,$update)

		if ( $lastPart.StartsWith('@') )
		{
			$newAttribute=$xmlDoc.CreateAttribute($lastPart.Trim("@"))
			([System.Xml.XmlElement]$parentNode).Attributes.Append($newAttribute) | Out-Null
			$newAttribute
		}
		else
		{
			$attribPartName="attribName"
			$nodePartName="nodeName"
			$attribPartValue="attribValue"

			$elementWithAttribFilterPattern=[Regex]"(?<$nodePartName>[\w]+)\[@(?<$attribPartName>[\w]+)='(?<$attribPartValue>[\w|\W]+)'\]"
			$nodeName=$lastPart.Trim()
			$newAttribute=$null
			$elementWithAttribMatches=$elementWithAttribFilterPattern.Match($lastPart)
			if($elementWithAttribMatches.Success)
			{
				$matchesCollection=$elementWithAttribMatches.Groups
				$nodeName=$matchesCollection[$nodePartName]
				$newAttribute=$xmlDoc.CreateAttribute($matchesCollection[$attribPartName])
				$newAttribute.Value=$matchesCollection[$attribPartValue]
			}
			$newNode=$xmlDoc.CreateElement($nodeName)
			if($newAttribute -ne $null){([System.Xml.XmlElement]$newNode).Attributes.Append($newAttribute)| Out-Null}

			if($update.InsertBefore -ne $null)			
			{
				$referenceElementToInsertBefore=$xmlDoc.SelectSingleNode($update.InsertBefore)
				if($referenceElementToInsertBefore -eq $null)
				{
					throw ('EditXmlInvalidInsertBeforeSpecificationException: A new element given by "{0}" cannot be created because InsertBefore "{1}" does not exists' -f $update.XPath,$update.InsertBefore)
				}
				if(([System.Xml.XmlNode]$referenceElementToInsertBefore).ParentNode -ne $parentNode)
				{
					throw ('EditXmlInvalidInsertBeforeSpecificationException: The element "{0}" parent node needs to the same as the InsertBefore "{1}" parent node' -f $update.XPath,$update.InsertBefore)
				}
				([System.Xml.XmlElement]$parentNode).InsertBefore($newNode,$referenceElementToInsertBefore) | Out-Null
			}
			else
			{
				([System.Xml.XmlElement]$parentNode).AppendChild($newNode) | Out-Null
			}
			$newNode
		}
	}

	function GetFirstNode
	{
		param($nodes)
		if($nodes -eq $null)
		{
			$null
		}
		else
		{
			$nodes[0]
		}
	}
	#endregion

	function EditXml
	{
		[CmdletBinding(SupportsShouldProcess=$true)]
		param(
			[String]
			$xmlFileFullName, 
			[Microsoft.Management.Infrastructure.CimInstance[]]
			$updateSpecs,
			[ref][bool]
			$isDifferent)    
	
		if (-not( Test-Path $xmlFileFullName ) )
		{
			throw ('ExceptionFileNotFound: EditXml failed because "{0}" was not found' -f $xmlFileFullName)
		}

		$xmlFileInfo=Get-Item $xmlFileFullName 
		if ( $xmlFileInfo.IsReadOnly ) 
		{
			Set-ItemProperty $xmlFileInfo.FullName IsReadOnly $false
		}

		$xmlDoc=[xml](gc $xmlFileFullName)
		$originalXml=$xmlDoc.InnerXml;

		# review need
		#$nspcMgr=New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
		#$xmlDoc.DocumentElement.Attributes | where{$_.Prefix -eq "xmlns"}|%{
		#    Write-Host $nspcMgr.AddNamespace($_.Name.Replace("xmlns:",""),$_.Value)
		#}

		$updateSpecs |%{
			$update=$_  
          
			$xpath=$update.XPath
			$contentSpecificationName=$xpath
			if(-not([string]::IsNullOrEmpty($update.Name)))
			{
				$contentSpecificationName=$update.Name
			}

			Write-Debug ("Start processing {0} ..." -f $contentSpecificationName)
			$nodes=$xmlDoc.SelectNodes($xpath)
			$type="Update"
			$strict=$false
			if($update.Strict -ne $null){$strict=$update.Strict}
			if ( $update.Type -ne $null ){ $type=$update.Type }

			if($type -eq "Remove" -and $nodes -ne $null)
			{
				$type="Remove"
				$nodes | %{
					$node=$_    
					$parent=$node.ParentNode    
					$parent.RemoveChild($node) |Out-Null
				}
				return
            
			}

			$node=GetFirstNode $nodes
			if ( $type -eq "Update" -and $node -eq $null -and -not($strict))
			{
				$type="Add"
				CreateNodesIfItDoesntExists $xmlDoc $update
			}

			if ( $type -eq "Update" )
			{
				if($node -is [System.Xml.XmlAttribute])
				{
					([System.Xml.XmlAttribute]$node).Value = $update.Value
				}

				if($node -is [System.Xml.XmlElement])
				{
					([System.Xml.XmlElement]$node).InnerText= $update.Value
				}
			}

			Write-Debug ("Completed processing {0}" -f $contentSpecificationName)
		}

		$isDifferent.Value=($xmlDoc.InnerXml.CompareTo($originalXml) -ne 0)
		if( $isDifferent.Value -and $PSCmdlet.ShouldProcess(("Edit of {0} On {1} results in new content below`n{2}" -f $xmlFileFullName,$env:COMPUTERNAME,$xmlDoc.DocumentElement.OuterXml)))
		{
			$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding($False)
			
			$xmlTextWriterSettings = New-Object System.Xml.XmlWriterSettings 
			$xmlTextWriterSettings.Indent=$true;
			$xmlTextWriterSettings.IndentChars="`t";
			$xmlTextWriterSettings.NewLineChars="`r`n";
			$xmlTextWriterSettings.Encoding=$Utf8NoBomEncoding 
			$xmlTextWriterSettings.NewLineHandling = [System.Xml.NewLineHandling]::Replace;
			$xmlTextWriter = [System.Xml.XmlTextWriter]::Create($xmlFileFullName,$xmlTextWriterSettings)
			$xmlDoc.Save($xmlTextWriter);
		}
	} 
#endregion

function Get-TargetResource
{
	[CmdletBinding()]
    [OutputType([System.Collections.Hashtable])]
    param
    (
        [parameter(Mandatory = $true)]
        [System.String]
        $FileFullName,

		[parameter(Mandatory = $true)]
        [Microsoft.Management.Infrastructure.CimInstance[]]
		$ContentSpec 
    )

	@{ContentType=$ContentType;FileFullName=$FileFullName;ContentSpec=$ContentSpec}
}


function Test-TargetResource
{
	[CmdletBinding()]
    [OutputType([System.Boolean])]
    param
    (
        [parameter(Mandatory = $true)]
        [System.String]
        $FileFullName,

		[parameter(Mandatory = $true)]
        [Microsoft.Management.Infrastructure.CimInstance[]]
		$ContentSpec 
    )

	$isDifferent=$false
	EditXml $FileFullName $ContentSpec ([ref]$isDifferent) -WhatIf | Out-Null
	-not($isDifferent)
}

function Set-TargetResource
{
	[CmdletBinding()]
    param
    (
        [parameter(Mandatory = $true)]
        [System.String]
        $FileFullName,

		[parameter(Mandatory = $true)]
        [Microsoft.Management.Infrastructure.CimInstance[]]
		$ContentSpec 
    )

	$isDifferent=$false
	EditXml $FileFullName $ContentSpec ([ref]$isDifferent) | Out-Null
}
